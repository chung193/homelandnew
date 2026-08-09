import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

export const setDayjsLocale = (lang) => {
    dayjs.locale(lang === 'vi' ? 'vi' : 'en');
};
