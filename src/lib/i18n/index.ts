import { derived } from 'svelte/store';
import { page } from '$app/stores';
import ru from './ru.json';
import tg from './tg.json';
import en from './en.json';

export const LANGS = ['ru', 'tg', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'ru';
export const LANG_COOKIE = 'lang';

const dictionaries: Record<Lang, Record<string, string>> = { ru, tg, en };

/** Коды для Intl: у таджикского нет своих правил, берём русские. */
const INTL_LOCALE: Record<Lang, string> = { ru: 'ru-RU', tg: 'ru-RU', en: 'en-GB' };

/** Что написано на кнопке языка. Коротко: в панели мало места. */
export const LANG_LABEL: Record<Lang, string> = { ru: 'РУ', tg: 'ТҶ', en: 'EN' };

export function isLang(value: unknown): value is Lang {
	return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/**
 * Перевод по ключу. Если ключа нет в таджикском словаре — падаем на русский,
 * а не показываем человеку сырой ключ.
 */
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
	let text = dictionaries[lang]?.[key] ?? dictionaries[DEFAULT_LANG][key] ?? key;
	if (vars) {
		for (const [name, value] of Object.entries(vars)) {
			text = text.replaceAll(`{${name}}`, String(value));
		}
	}
	return text;
}

/**
 * Счётные формы: «1 запись», «2 записи», «5 записей».
 * У английского форм две — «1 recording» и «2 recordings», — поэтому
 * там few и many совпадают, и в словаре они просто продублированы.
 */
export function plural(lang: Lang, count: number, keyPrefix: string): string {
	const rule = new Intl.PluralRules(INTL_LOCALE[lang]).select(count);
	const suffix = rule === 'one' ? 'one' : rule === 'few' ? 'few' : 'many';
	return translate(lang, `${keyPrefix}.${suffix}`);
}

export function formatDate(lang: Lang, iso: string | null): string {
	if (!iso) return '';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat(lang === 'tg' ? 'tg-TJ' : INTL_LOCALE[lang], {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

/**
 * Язык лежит в данных layout, поэтому переводчик — производный store:
 * в компонентах пишем `{$t('nav.archive')}` без проброса языка через пропсы.
 */
export const t = derived(
	page,
	($page) =>
		(key: string, vars?: Record<string, string | number>): string =>
			translate(($page.data.lang as Lang) ?? DEFAULT_LANG, key, vars)
);

export const lang = derived(page, ($page) => ($page.data.lang as Lang) ?? DEFAULT_LANG);
