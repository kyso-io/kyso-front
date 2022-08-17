import slugify from 'slugify';

export default function (text: string) {
  return slugify(text, {
    replacement: '-',
    lower: true,
    strict: true,
    trim: true,
  });
}
