/**
 * Примеры на время, пока не подключена база.
 *
 * Те же данные, что в supabase/seed.sql: сайт должно быть видно с людьми
 * и записями, иначе ни дизайн, ни механику не оценить, а показать проект
 * человеку — тем более.
 *
 * Работает только при пустом .env: как только появятся ключи Supabase,
 * ленты берут настоящие данные и сюда не заглядывают. Ничего удалять
 * не придётся.
 *
 * Тексты русские: это заглушка, а не контент. Настоящие записи придут
 * от людей и будут на том языке, на котором их рассказали.
 */
import type { HeritageType, MediaKind, PersonRole, TaskStatus } from './types';

function daysAgo(n: number): string {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d.toISOString().slice(0, 10);
}

function daysAhead(n: number): string {
	return daysAgo(-n);
}

export type DemoRecord = {
	id: string;
	title: string;
	type: HeritageType;
	subtype: string;
	carrier_name: string;
	media_kind: MediaKind;
	media_url: string | null;
	body: string;
	location: string;
	date_recorded: string;
	recorded_by: null;
	created_at: string;
	recorder: { display_name: string } | null;
};

export const DEMO_RECORDS: DemoRecord[] = [
	{
		id: 'demo-alla',
		title: 'Колыбельная «Алла» с припевом про горного козла',
		type: 'song',
		subtype: '',
		carrier_name: 'Зайнаб Раҳимова, 84 года',
		media_kind: 'text',
		media_url: null,
		body: 'Алла, бачаҷон, алла…\n\nЗайнаб-бибӣ поёт эту колыбельную с припевом, где к ребёнку приходит горный козёл и приносит сон. Говорит, так пела её мать в Искодаре, а в соседнем кишлаке припев другой — про журавля. Второго варианта мы пока не нашли.',
		location: 'кишлак Искодар, Айнинский район',
		date_recorded: daysAgo(34),
		recorded_by: null,
		created_at: daysAgo(34),
		recorder: { display_name: 'Нигора Исмоилова' }
	},
	{
		id: 'demo-platok',
		title: 'Как повязывают платок невесте перед выходом из отцовского дома',
		type: 'ritual',
		subtype: '',
		carrier_name: 'Мохира Назарова, 71 год',
		media_kind: 'text',
		media_url: null,
		body: 'Платок повязывает не мать, а старшая замужняя женщина со стороны отца — мать в это время не должна смотреть. Узел завязывают трижды и каждый раз проговаривают пожелание. Мохира-апа помнит все три; в городских свадьбах сейчас говорят одно общее.',
		location: 'Пенджикент',
		date_recorded: daysAgo(28),
		recorded_by: null,
		created_at: daysAgo(28),
		recorder: { display_name: 'Малика Раҷабова' }
	},
	{
		id: 'demo-chakan',
		title: 'Счёт петель в чакане: названия узоров, которых нет в книгах',
		type: 'craft',
		subtype: '',
		carrier_name: 'Гулбахор Сафарова, мастерица',
		media_kind: 'text',
		media_url: null,
		body: '«Мурғи об», «чашми булбул», «шохи оҳу» — Гулбахор-апа называет узоры так, как их называла её свекровь. В музейных подписях те же узоры подписаны по-другому. Она согласилась показать порядок стежков на камеру, если приехать до холодов — зимой руки болят.',
		location: 'Кулябский район, Хатлон',
		date_recorded: daysAgo(21),
		recorded_by: null,
		created_at: daysAgo(21),
		recorder: { display_name: 'Далер Нуров' }
	},
	{
		id: 'demo-melnica',
		title: 'Рассказ о том, как в 1953 году всем кишлаком переносили мельницу',
		type: 'oral_history',
		subtype: '',
		carrier_name: 'Абдулло Каримов, 89 лет',
		media_kind: 'text',
		media_url: null,
		body: 'Вода ушла, и мельницу разобрали и перенесли на четыреста шагов выше по руслу. Абдулло-бобо называет по именам восьмерых, кто нёс жернов, и помнит, кто что кричал. Из тех восьмерых он остался один.',
		location: 'кишлак Ревад, Айнинский район',
		date_recorded: daysAgo(14),
		recorded_by: null,
		created_at: daysAgo(14),
		recorder: { display_name: 'Фаррух Каримов' }
	},
	{
		id: 'demo-falak',
		title: 'Фалак без инструмента — как пели в дороге',
		type: 'song',
		subtype: '',
		carrier_name: 'Сафар Одинаев, 77 лет',
		media_kind: 'text',
		media_url: null,
		body: 'Сафар-ака объясняет, что дорожный фалак поют иначе, чем на празднике: тише, без украшений, чтобы хватало дыхания на подъёме. Показал два куплета; говорит, дальше вспомнит, если пройтись по той тропе.',
		location: 'Дарвазский район',
		date_recorded: daysAgo(9),
		recorded_by: null,
		created_at: daysAgo(9),
		recorder: { display_name: 'Нигора Исмоилова' }
	},
	{
		id: 'demo-navruz',
		title: 'Наврузский стол: что ставили, когда не было денег',
		type: 'ritual',
		subtype: '',
		carrier_name: 'Саодат Юсупова, 80 лет',
		media_kind: 'text',
		media_url: null,
		body: 'Семь предметов на столе — это то, что знают все. Саодат-апа рассказала, чем заменяли недостающее в голодные годы и почему сумалак варили в складчину на четыре дома. Эта часть обычая из современных описаний пропала.',
		location: 'Худжанд',
		date_recorded: daysAgo(5),
		recorded_by: null,
		created_at: daysAgo(5),
		recorder: { display_name: 'Далер Нуров' }
	},
	{
		id: 'demo-glina',
		title: 'Как выбирают глину для кувшина и почему её топчут ногами',
		type: 'craft',
		subtype: '',
		carrier_name: 'Рустам Шарипов, гончар',
		media_kind: 'text',
		media_url: null,
		body: 'Рустам-ака берёт глину из двух мест и смешивает; объясняет, как понять готовность на ощупь — «глина должна отвечать ноге». Ученика у него сейчас нет.',
		location: 'Истаравшан',
		date_recorded: daysAgo(2),
		recorded_by: null,
		created_at: daysAgo(2),
		recorder: { display_name: 'Сурайё Ҷалилова' }
	}
];

export type DemoPerson = {
	id: string;
	name: string;
	role: PersonRole;
	skills_or_knowledge: string;
	skill_tags: string[];
	location: string;
	contact: string;
	profile_id: null;
	added_by: null;
	created_at: string;
};

export const DEMO_PEOPLE: DemoPerson[] = [
	{
		id: 'p1',
		name: 'Зайнаб Раҳимова',
		role: 'carrier',
		skills_or_knowledge: 'Помню колыбельные и свадебные обряды Искодара',
		skill_tags: [],
		location: 'кишлак Искодар',
		contact: 'через внучку Нигору: @nigora_isk',
		profile_id: null,
		added_by: null,
		created_at: daysAgo(40)
	},
	{
		id: 'p2',
		name: 'Гулбахор Сафарова',
		role: 'carrier',
		skills_or_knowledge: 'Вышивка чакан, старые названия узоров',
		skill_tags: [],
		location: 'Кулябский район',
		contact: '+992 900 12 34 56',
		profile_id: null,
		added_by: null,
		created_at: daysAgo(35)
	},
	{
		id: 'p3',
		name: 'Абдулло Каримов',
		role: 'carrier',
		skills_or_knowledge: 'Помню, как жил кишлак до водохранилища',
		skill_tags: [],
		location: 'кишлак Ревад',
		contact: 'через сына Фаррух: +992 918 77 11 22',
		profile_id: null,
		added_by: null,
		created_at: daysAgo(30)
	},
	{
		id: 'p4',
		name: 'Нигора Исмоилова',
		role: 'helper',
		skills_or_knowledge: 'Студентка-этнограф, могу ездить по выходным и расшифровывать записи',
		skill_tags: ['recording', 'transcription', 'organising'],
		location: 'Душанбе',
		contact: '@nigora_isk',
		profile_id: null,
		added_by: null,
		created_at: daysAgo(25)
	},
	{
		id: 'p5',
		name: 'Фаррух Каримов',
		role: 'helper',
		skills_or_knowledge: 'Есть машина, вожу в Айнинский район по субботам',
		skill_tags: ['transport', 'recording'],
		location: 'Айни',
		contact: '+992 918 77 11 22',
		profile_id: null,
		added_by: null,
		created_at: daysAgo(20)
	},
	{
		id: 'p6',
		name: 'Далер Нуров',
		role: 'helper',
		skills_or_knowledge: 'Снимаю и монтирую видео, есть петличный микрофон',
		skill_tags: ['filming', 'editing'],
		location: 'Худжанд',
		contact: '@daler_nurov',
		profile_id: null,
		added_by: null,
		created_at: daysAgo(15)
	},
	{
		id: 'p7',
		name: 'Сурайё Ҷалилова',
		role: 'helper',
		skills_or_knowledge: 'Перевожу с таджикского на русский и английский, пишу расшифровки',
		skill_tags: ['translation', 'transcription'],
		location: 'Душанбе',
		contact: '@surayyo_tj',
		profile_id: null,
		added_by: null,
		created_at: daysAgo(10)
	},
	{
		id: 'p8',
		name: 'Малика Раҷабова',
		role: 'helper',
		skills_or_knowledge: 'Работаю в доме культуры, помогу договориться о зале для посиделок',
		skill_tags: ['organising'],
		location: 'Пенджикент',
		contact: '+992 92 555 33 11',
		profile_id: null,
		added_by: null,
		created_at: daysAgo(6)
	}
];

export type DemoTask = {
	id: string;
	title: string;
	description: string;
	deadline: string;
	status: TaskStatus;
	created_by: null;
	result_record_id: string | null;
	created_at: string;
	responder_count: number;
	author: { display_name: string } | null;
	result_record: { id: string; title: string } | null;
};

export const DEMO_TASKS: DemoTask[] = [
	{
		id: 'demo-zhuravl',
		title: 'Записать второй вариант колыбельной «Алла» — про журавля',
		description:
			'Зайнаб-бибӣ говорит, что в соседнем кишлаке тот же напев поют с другим припевом. Нужно доехать до Ревада и спросить у пожилых женщин. Достаточно телефона и часа времени.',
		deadline: daysAhead(9),
		status: 'in_progress',
		created_by: null,
		result_record_id: null,
		created_at: daysAgo(12),
		responder_count: 2,
		author: { display_name: 'Нигора Исмоилова' },
		result_record: null
	},
	{
		id: 'demo-stezhki',
		title: 'Снять на видео порядок стежков чакана у Гулбахор-апа',
		description:
			'Она согласилась показать, но только до холодов — зимой руки болят. Нужен человек с камерой или хорошим телефоном и штативом, полдня в Кулябском районе.',
		deadline: daysAhead(12),
		status: 'open',
		created_by: null,
		result_record_id: null,
		created_at: daysAgo(8),
		responder_count: 1,
		author: { display_name: 'Далер Нуров' },
		result_record: null
	},
	{
		id: 'demo-rasshifrovka',
		title: 'Расшифровать текстом запись рассказа Абдулло-бобо про мельницу',
		description:
			'Аудио 40 минут, говорит неспешно, но с местными словами. Нужен тот, кто понимает айнинский говор. Работа из дома.',
		deadline: daysAhead(5),
		status: 'open',
		created_by: null,
		result_record_id: null,
		created_at: daysAgo(6),
		responder_count: 0,
		author: { display_name: 'Фаррух Каримов' },
		result_record: null
	},
	{
		id: 'demo-uchenik',
		title: 'Найти ученика для гончара Рустама-ака',
		description:
			'Рустаму-ака 68, ученика нет. Спросить в художественном училище Истаравшана, есть ли желающие приходить раз в неделю. Нужно просто сходить и поговорить.',
		deadline: daysAhead(20),
		status: 'open',
		created_by: null,
		result_record_id: null,
		created_at: daysAgo(4),
		responder_count: 0,
		author: { display_name: 'Сурайё Ҷалилова' },
		result_record: null
	},
	{
		id: 'demo-posidelki',
		title: 'Договориться о зале для первых посиделок в Пенджикенте',
		description:
			'Малика-апа работает в доме культуры и готова помочь. Нужно выбрать субботу, позвать три-четыре семьи и записать то, что вспомнят за чаем. Платформа не заменяет живую встречу — с неё всё и начинается.',
		deadline: daysAhead(16),
		status: 'open',
		created_by: null,
		result_record_id: null,
		created_at: daysAgo(3),
		responder_count: 3,
		author: { display_name: 'Малика Раҷабова' },
		result_record: null
	},
	{
		id: 'demo-navruz-task',
		title: 'Записать наврузские обряды у Саодат-апа в Худжанде',
		description: 'Сделано: съездили, записали рассказ про сумалак в складчину.',
		deadline: daysAgo(5),
		status: 'done',
		created_by: null,
		result_record_id: 'demo-navruz',
		created_at: daysAgo(18),
		responder_count: 2,
		author: { display_name: 'Далер Нуров' },
		result_record: { id: 'demo-navruz', title: 'Наврузский стол: что ставили, когда не было денег' }
	}
];
