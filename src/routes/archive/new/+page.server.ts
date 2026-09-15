import { fail, redirect } from '@sveltejs/kit';
import { HERITAGE_TYPES, isValidSubtype, type HeritageType, type MediaKind } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

const MAX_BYTES = 50 * 1024 * 1024;

export const load: PageServerLoad = async ({ locals }) => ({
	canWrite: Boolean(locals.user)
});

function kindFromMime(mime: string): MediaKind | null {
	if (mime.startsWith('audio/')) return 'audio';
	if (mime.startsWith('video/')) return 'video';
	if (mime.startsWith('image/')) return 'photo';
	return null;
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/auth/login?next=/archive/new');

		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const carrierName = String(form.get('carrier_name') ?? '').trim();
		const type = String(form.get('type') ?? '') as HeritageType;
		const subtype = String(form.get('subtype') ?? '').trim();
		const location = String(form.get('location') ?? '').trim();
		const dateRecorded = String(form.get('date_recorded') ?? '').trim();
		const body = String(form.get('body') ?? '').trim();
		const file = form.get('file');

		const values = { title, carrierName, type, subtype, location, dateRecorded, body };

		if (!title || !carrierName || !HERITAGE_TYPES.includes(type)) {
			return fail(400, { ...values, missingFields: true });
		}

		// Подраздел принимаем только из списка: иначе через полгода в архиве
		// будут «колыбельная», «колыбельные» и «алла» как три разных раздела.
		if (!isValidSubtype(type, subtype)) {
			return fail(400, { ...values, badSubtype: true });
		}

		const hasFile = file instanceof File && file.size > 0;
		if (!hasFile && !body) {
			return fail(400, { ...values, needContent: true });
		}

		let mediaKind: MediaKind = 'text';
		let mediaPath: string | null = null;

		if (hasFile) {
			const uploaded = file as File;
			if (uploaded.size > MAX_BYTES) {
				return fail(400, { ...values, tooLarge: true });
			}

			const kind = kindFromMime(uploaded.type);
			if (!kind) {
				return fail(400, { ...values, badFileType: true });
			}
			mediaKind = kind;

			const extension = uploaded.name.includes('.') ? uploaded.name.split('.').pop() : 'bin';
			const path = `${locals.user.id}/${crypto.randomUUID()}.${extension}`;

			const { error: uploadError } = await locals.supabase.storage
				.from('media')
				.upload(path, uploaded, { contentType: uploaded.type, upsert: false });

			if (uploadError) {
				return fail(500, { ...values, uploadFailed: true });
			}
			mediaPath = path;
		}

		const { data, error } = await locals.supabase
			.from('records')
			.insert({
				title,
				type,
				subtype,
				carrier_name: carrierName,
				media_kind: mediaKind,
				media_url: mediaPath,
				body: mediaKind === 'text' ? body : body || null,
				location,
				date_recorded: dateRecorded || null,
				recorded_by: locals.user.id
			})
			.select('id')
			.single();

		if (error || !data) {
			// Файл уже в хранилище, а строки нет — убираем за собой,
			// иначе бесплатный тариф забьётся мусором от неудачных попыток.
			if (mediaPath) {
				await locals.supabase.storage.from('media').remove([mediaPath]);
			}
			return fail(500, { ...values, saveFailed: true });
		}

		redirect(303, `/archive/${data.id}`);
	}
};
