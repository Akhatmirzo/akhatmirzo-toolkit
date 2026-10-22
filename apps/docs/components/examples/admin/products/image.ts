/**
 * Yuklangan rasmni kichraytirib, data: URL qiladi — localStorage'da saqlash uchun
 * (blob: URL sahifa yangilanganda yo'qoladi). Haqiqiy loyihada rasm serverga yuklanadi.
 */
export async function toThumbnail(file: File, size = 480): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, size / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
