/**
 * Проверка связи с Supabase: доходит ли запрос, накатана ли миграция,
 * создан ли bucket для медиа. Запуск: npm run db:check
 *
 * Отвечает на единственный вопрос: можно ли уже работать — и если нет,
 * то на каком именно шаге настройки всё стоит.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const TABLES = ['records', 'people', 'tasks', 'task_responders', 'profiles'];

function readEnv() {
	let raw;
	try {
		raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
	} catch {
		console.error('Нет файла .env. Скопируйте .env.example в .env и впишите ключи.');
		process.exit(1);
	}

	const env = {};
	for (const line of raw.split('\n')) {
		const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
		if (match) env[match[1]] = match[2].trim();
	}
	return env;
}

const env = readEnv();
const url = env.PUBLIC_SUPABASE_URL;
const key = env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key || url.includes('example.supabase.co') || key === 'replace-me') {
	console.error('В .env ещё заглушки. Подставьте Project URL и anon-ключ из Supabase:');
	console.error('  Project Settings → API');
	process.exit(1);
}

const supabase = createClient(url, key);
let failed = false;

console.log(`Проект: ${url}\n`);

for (const table of TABLES) {
	const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

	if (error) {
		failed = true;
		const hint =
			error.code === '42P01'
				? ' — таблицы нет, выполните supabase/migrations/0001_init.sql в SQL Editor'
				: '';
		console.log(`  ✗ ${table}: ${error.message}${hint}`);
	} else {
		console.log(`  ✓ ${table}: строк ${count}`);
	}
}

const { error: storageError } = await supabase.storage.from('media').list('', { limit: 1 });
if (storageError) {
	failed = true;
	console.log(`  ✗ хранилище media: ${storageError.message}`);
} else {
	console.log('  ✓ хранилище media доступно');
}

// Права: аноним обязан читать, но не писать. Если запись прошла — RLS не включён,
// и любой прохожий сможет портить чужие материалы.
const { error: writeError } = await supabase
	.from('records')
	.insert({ title: 'проверка RLS', type: 'song', carrier_name: 'проверка', media_kind: 'text', body: 'x' })
	.select('id');

if (writeError) {
	console.log('  ✓ анонимная запись отклонена — RLS работает');
} else {
	failed = true;
	console.log('  ✗ ОПАСНО: аноним смог добавить запись. Проверьте, что RLS включён.');
}

console.log(failed ? '\nЕсть проблемы — см. выше.' : '\nВсё готово, можно запускать npm run dev.');
process.exit(failed ? 1 : 0);
