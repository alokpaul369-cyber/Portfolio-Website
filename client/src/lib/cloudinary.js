/**
 * Cloudinary delivery helpers. Cloudinary transforms images on the fly when
 * instructions are added to the URL, so uploads never need manual resizing.
 */

/**
 * Portrait version of an uploaded photo: cropped to 4:5 around the face,
 * 800 px wide, in the best format and quality for each browser.
 * Non-Cloudinary URLs (such as the bundled default photo) are returned unchanged.
 *
 * @param {string} url
 */
export function portraitUrl(url) {
  if (!url || !/res\.cloudinary\.com\/.+\/image\/upload\//.test(url)) return url;
  return url.replace('/image/upload/', '/image/upload/c_fill,g_face,ar_4:5,w_800,f_auto,q_auto/');
}
