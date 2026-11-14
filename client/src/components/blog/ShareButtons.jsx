import { createElement, useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { TbBrandFacebook, TbBrandLinkedin, TbBrandX } from 'react-icons/tb';
import { toast } from 'sonner';

/**
 * Copies text to the clipboard. Uses the Clipboard API, and falls back to a
 * temporary text area with execCommand where the API is unavailable or denied.
 * @returns {Promise<boolean>} whether the text was copied
 */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  }
}

const buttonClass =
  'inline-flex size-9 items-center justify-center rounded-md border border-border text-muted transition-colors duration-200 hover:border-primary/50 hover:text-primary';

/**
 * Share links for an article. Uses each network's public share URL, so no
 * third-party scripts are loaded. "Copy link" writes the URL to the clipboard.
 *
 * @param {{ url: string, title: string }} props
 */
export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    {
      label: 'LinkedIn',
      Icon: TbBrandLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'X',
      Icon: TbBrandX,
      href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: 'Facebook',
      Icon: TbBrandFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  const copyLink = async () => {
    if (await copyText(url)) {
      setCopied(true);
      toast.success('Link copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('The link could not be copied. Please copy it from the address bar.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted">Share this article</span>
      <ul className="flex items-center gap-2">
        {networks.map(({ label, Icon, href }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${label}`}
              title={`Share on ${label}`}
              className={buttonClass}
            >
              {createElement(Icon, { className: 'size-4', strokeWidth: 1.75, 'aria-hidden': true })}
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={copyLink}
            aria-label={copied ? 'Link copied' : 'Copy link'}
            title="Copy link"
            className={buttonClass}
          >
            {copied ? (
              <Check className="size-4 text-success" aria-hidden="true" />
            ) : (
              <Link2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </li>
      </ul>
    </div>
  );
}
