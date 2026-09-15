import { HERITAGE_TYPES, subtypesOf, type HeritageType } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const type = url.searchParams.get('type') ?? '';
	const subtype = url.searchParams.get('subtype') ?? '';
	const q = (url.searchParams.get('q') ?? '').trim();

	let query = locals.supabase
		.from('records')
		.select(
			'id, title, type, subtype, carrier_name, media_kind, media_url, location, date_recorded, created_at'
		)
		.order('created_at', { ascending: false })
		.limit(60);

	if (HERITAGE_TYPES.includes(type as HeritageType)) {
		query = query.eq('type', type);

		// Подраздел имеет смысл только внутри типа: «колыбельные» без «песни»
		// ничего не значат, поэтому фильтруем по нему лишь вместе с типом.
		if (subtype && subtypesOf(type as HeritageType).includes(subtype)) {
			query = query.eq('subtype', subtype);
		}
	}

	if (q) {
		// Ищем и по названию, и по имени носителя, и по месту: люди чаще
		// помнят «бабушка Зайнаб», чем название записи.
		const escaped = q.replace(/[%,()]/g, ' ');
		query = query.or(
			`title.ilike.%${escaped}%,carrier_name.ilike.%${escaped}%,location.ilike.%${escaped}%`
		);
	}

	const { data, error } = await query;

	return {
		records: data ?? [],
		type,
		subtype,
		q,
		loadError: Boolean(error)
	};
};
