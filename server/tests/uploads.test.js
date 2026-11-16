/** CV upload: type, content and size checks, storage as a raw file, and clean-up on replace. */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Cloudinary is replaced entirely; nothing leaves the machine.
const cloud = vi.hoisted(() => ({
  configured: true,
  uploads: [],
  destroyed: [],
}));

vi.mock('../src/config/cloudinary.js', () => ({
  get isCloudinaryConfigured() {
    return cloud.configured;
  },
  default: {
    uploader: {
      upload_stream(options, callback) {
        return {
          end() {
            cloud.uploads.push(options);
            // Like Cloudinary, a raw file only has an extension when the public id carries one.
            const name = options.public_id ?? `generated-${cloud.uploads.length}`;
            const id = `${options.folder}/${name}`;
            callback(null, {
              secure_url: `https://res.cloudinary.com/demo/raw/upload/${id}`,
              public_id: id,
            });
          },
        };
      },
      async destroy(publicId, options) {
        cloud.destroyed.push({ publicId, ...options });
        return { result: 'ok' };
      },
    },
  },
}));

const { agentFor, createTestApp, loginAgent } = await import('./helpers.js');

const app = createTestApp();
const PDF = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
const pdfUpload = (agent, buffer = PDF, name = 'My CV.pdf', type = 'application/pdf') =>
  agent.post('/api/uploads/document').attach('file', buffer, { filename: name, contentType: type });

let admin;

beforeEach(async () => {
  cloud.configured = true;
  cloud.uploads.length = 0;
  cloud.destroyed.length = 0;
  admin = await loginAgent(app);
});

describe('POST /api/uploads/document', () => {
  it('requires a signed-in admin', async () => {
    const response = await pdfUpload(agentFor(app));
    expect(response.status).toBe(401);
    expect(cloud.uploads).toHaveLength(0);
  });

  it('stores a valid PDF as a raw file in the documents folder', async () => {
    const response = await pdfUpload(admin);
    expect(response.status).toBe(201);
    expect(response.body.data.filename).toBe('My CV.pdf');
    expect(response.body.data.publicId).toMatch(/^portfolio\/documents\//);
    expect(cloud.uploads[0]).toMatchObject({
      resource_type: 'raw',
      folder: 'portfolio/documents',
    });
  });

  it('gives the stored file a unique id that ends in .pdf', async () => {
    const first = (await pdfUpload(admin)).body.data;
    const second = (await pdfUpload(admin)).body.data;
    expect(first.publicId).toMatch(/^portfolio\/documents\/cv-[\w-]+\.pdf$/);
    expect(first.url.endsWith('.pdf')).toBe(true);
    expect(second.publicId).not.toBe(first.publicId);
  });

  it('explains the expected field when the file is sent under another name', async () => {
    const response = await admin
      .post('/api/uploads/document')
      .attach('image', PDF, { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/"file"/);
  });

  it('rejects an image', async () => {
    const response = await pdfUpload(admin, Buffer.from('fake'), 'photo.png', 'image/png');
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/PDF/);
    expect(cloud.uploads).toHaveLength(0);
  });

  it('rejects a file that claims to be a PDF but is not', async () => {
    const response = await pdfUpload(admin, Buffer.from('just some text'), 'cv.pdf');
    expect(response.status).toBe(400);
    expect(cloud.uploads).toHaveLength(0);
  });

  it('rejects a PDF over 4 MB', async () => {
    const large = Buffer.concat([PDF, Buffer.alloc(4 * 1024 * 1024)]);
    const response = await pdfUpload(admin, large);
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/4 MB/);
    expect(cloud.uploads).toHaveLength(0);
  });

  it('rejects a request with no file', async () => {
    const response = await admin.post('/api/uploads/document');
    expect(response.status).toBe(400);
  });

  it('answers 503 when uploads are not configured', async () => {
    cloud.configured = false;
    const response = await pdfUpload(admin);
    expect(response.status).toBe(503);
  });
});

describe('POST /api/uploads', () => {
  const PNG = Buffer.from('89504e470d0a1a0a', 'hex');
  const imageUpload = (folder) =>
    admin
      .post(`/api/uploads?folder=${folder}`)
      .attach('image', PNG, { filename: 'c.png', contentType: 'image/png' });

  it('accepts the certificates folder and rejects an unknown one', async () => {
    const response = await imageUpload('certificates');
    expect(response.status).toBe(201);
    expect(cloud.uploads.at(-1).folder).toBe('portfolio/certificates');

    expect((await imageUpload('elsewhere')).status).toBe(400);
  });
});

describe('saving the CV', () => {
  it('rejects an id that is not an uploaded document', async () => {
    const response = await admin.put('/api/settings').send({
      cv: {
        url: 'https://res.cloudinary.com/demo/image/upload/portfolio/projects/shot.png',
        publicId: 'portfolio/projects/shot.png',
        filename: 'cv.pdf',
      },
    });
    expect(response.status).toBe(400);
  });

  it('rejects a URL that does not point at the uploaded file', async () => {
    const cv = (await pdfUpload(admin)).body.data;
    for (const url of ['https://evil.test/cv.pdf', cv.url.replace('https://', 'http://')]) {
      const response = await admin.put('/api/settings').send({ cv: { ...cv, url } });
      expect(response.status).toBe(400);
    }
    expect((await agentFor(app).get('/api/settings')).body.data.cv).toBeNull();
  });
});

describe('CV clean-up', () => {
  it('deletes the previous file when the CV is replaced or removed', async () => {
    const first = (await pdfUpload(admin)).body.data;
    const second = (await pdfUpload(admin)).body.data;

    await admin.put('/api/settings').send({ cv: first });
    expect(cloud.destroyed).toHaveLength(0);

    await admin.put('/api/settings').send({ cv: second });
    expect(cloud.destroyed).toEqual([{ publicId: first.publicId, resource_type: 'raw' }]);

    await admin.put('/api/settings').send({ cv: null });
    expect(cloud.destroyed[1]).toEqual({ publicId: second.publicId, resource_type: 'raw' });
  });

  it('does not delete the file when other settings are saved', async () => {
    const cv = (await pdfUpload(admin)).body.data;
    await admin.put('/api/settings').send({ cv });
    await admin.put('/api/settings').send({ content: { role: 'Developer' } });
    expect(cloud.destroyed).toHaveLength(0);
  });

  it('refuses to delete a CV that is in use, and deletes an unused one', async () => {
    const used = (await pdfUpload(admin)).body.data;
    const unused = (await pdfUpload(admin)).body.data;
    await admin.put('/api/settings').send({ cv: used });

    const refused = await admin.delete('/api/uploads').send({ publicId: used.publicId });
    expect(refused.status).toBe(409);

    const removed = await admin.delete('/api/uploads').send({ publicId: unused.publicId });
    expect(removed.status).toBe(200);
    expect(cloud.destroyed).toEqual([{ publicId: unused.publicId, resource_type: 'raw' }]);
  });
});
