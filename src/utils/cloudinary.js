/**
 * Optimizes Cloudinary URLs to dramatically improve image load times.
 * Automatically converts formats (f_auto), optimizes compression (q_auto), and limits size (w_width).
 */
export function getOptimizedImageUrl(url, width) {
  if (!url || typeof url !== 'string') return url;
  
  // If it's not a Cloudinary URL, return as is
  if (!url.includes('cloudinary.com')) return url;
  
  // Locate the index of "/upload/"
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  
  // Base transformation: auto quality and auto format
  let transformation = 'q_auto,f_auto';
  if (width) {
    transformation += `,w_${width},c_limit`;
  }
  
  // Insert the transformation right after "/upload/"
  const beforeUpload = url.substring(0, uploadIndex + 8); // includes "/upload/"
  const afterUpload = url.substring(uploadIndex + 8);
  
  // Prevent duplicating if the URL already has custom transformations
  const hasExistingTransformation = /^[a-z]_[a-z0-9,_:=.\-]+?\//.test(afterUpload);
  if (hasExistingTransformation) {
    return url;
  }
  
  return `${beforeUpload}${transformation}/${afterUpload}`;
}
