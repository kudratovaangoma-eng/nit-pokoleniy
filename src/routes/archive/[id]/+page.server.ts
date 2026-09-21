import { error } from '@sveltejs/kit';
import { DEMO_RECORDS, DEMO_TASKS } from '$lib/demo';
import { supabaseConfigured } from '$lib/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!supabaseConfigured) {
		const record = DEMO_RECORDS.find((r) => r.id === params.id);
		if (!record) error(404, 'Запись не найдена');
		return {
			record,
			tasks: DEMO_TASKS.filter((t) => t.result_record_id === record.id).map((t) => ({
				id: t.id,
				title: t.title
			})),
			demo: true
		};
	}

	const { data, error: dbError } = await locals.supabase
		.from('records')
		.select(
			'id, title, type, subtype, carrier_name, media_kind, media_url, body, location, date_recorded, created_at, recorded_by, recorder:profiles!records_recorded_by_fkey(display_name)'
		)
		.eq('id', params.id)
		.maybeSingle();

	if (dbError || !data) error(404, 'Запись не найдена');

	// Задачи, результатом которых стала эта запись, — видимая связь
	// «дело → результат», ради которой лента дел и существует.
	const { data: tasks } = await locals.supabase
		.from('tasks')
		.select('id, title')
		.eq('result_record_id', params.id);

	return { record: data, tasks: tasks ?? [], demo: false };
};
