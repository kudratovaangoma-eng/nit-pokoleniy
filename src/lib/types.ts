export type HeritageType = 'song' | 'ritual' | 'craft' | 'oral_history';
export type MediaKind = 'audio' | 'video' | 'photo' | 'text';
export type PersonRole = 'carrier' | 'helper';
export type TaskStatus = 'open' | 'in_progress' | 'done';

export const HERITAGE_TYPES: HeritageType[] = ['song', 'ritual', 'craft', 'oral_history'];
export const PERSON_ROLES: PersonRole[] = ['carrier', 'helper'];

/** Навыки помощников. Список короткий намеренно: длинный никто не читает. */
export const SKILL_TAGS = [
	'запись',
	'съёмка',
	'монтаж',
	'перевод',
	'расшифровка',
	'организация',
	'транспорт'
] as const;

export type Profile = {
	id: string;
	display_name: string;
	contact: string;
	created_at: string;
};

export type Record = {
	id: string;
	title: string;
	type: HeritageType;
	/** Имя носителя. Показывается рядом с материалом всегда. */
	carrier_name: string;
	media_kind: MediaKind;
	media_url: string | null;
	body: string | null;
	location: string;
	date_recorded: string | null;
	recorded_by: string | null;
	created_at: string;
	/** Подтягивается join'ом для подписи «записал(а): …» */
	recorder?: Pick<Profile, 'display_name'> | null;
};

export type Person = {
	id: string;
	name: string;
	role: PersonRole;
	skills_or_knowledge: string;
	skill_tags: string[];
	location: string;
	contact: string;
	profile_id: string | null;
	added_by: string | null;
	created_at: string;
};

export type Task = {
	id: string;
	title: string;
	description: string;
	deadline: string;
	status: TaskStatus;
	created_by: string | null;
	result_record_id: string | null;
	created_at: string;
	/** Число откликнувшихся — часть механики вовлечения, а не украшение. */
	responder_count?: number;
	result_record?: Pick<Record, 'id' | 'title'> | null;
};

/** Тип контакта, чтобы предложить нужную кнопку: позвонить или написать. */
export function contactHref(contact: string): string | null {
	const value = contact.trim();
	if (!value) return null;
	if (value.startsWith('@')) return `https://t.me/${value.slice(1)}`;
	if (/^https?:\/\//.test(value)) return value;
	if (/^[+\d][\d\s()-]{6,}$/.test(value)) return `tel:${value.replace(/[\s()-]/g, '')}`;
	return null;
}
