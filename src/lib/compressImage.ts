const MAX_SIDE = 1600;
const QUALITY = 0.82;

/**
 * Фото с телефона весит 4–8 МБ. По мобильному интернету в кишлаке такая
 * загрузка либо идёт минутами, либо обрывается — и человек теряет запись,
 * ради которой ехал. Ужимаем до разумного размера прямо в браузере.
 * Если что-то пошло не так — возвращаем исходный файл, а не ошибку.
 */
export async function compressImage(file: File): Promise<File> {
	if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
		if (scale === 1 && file.size < 1_000_000) return file;

		const canvas = document.createElement('canvas');
		canvas.width = Math.round(bitmap.width * scale);
		canvas.height = Math.round(bitmap.height * scale);

		const ctx = canvas.getContext('2d');
		if (!ctx) return file;
		ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		bitmap.close();

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', QUALITY)
		);
		if (!blob || blob.size >= file.size) return file;

		return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
	} catch {
		return file;
	}
}
