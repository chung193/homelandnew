import type {Locale} from '../i18n/config';

const viStatuses:Record<string,string>={draft:'Bản nháp',pending:'Chờ duyệt',approved:'Đã duyệt',published:'Đã xuất bản',confirmed:'Đã xác nhận',in_progress:'Đang thuê',completed:'Hoàn thành',cancelled:'Đã hủy',rejected:'Bị từ chối',archived:'Đã lưu trữ',sold:'Đã bán',rented:'Đã cho thuê',paid:'Đã thanh toán',failed:'Thất bại',refunded:'Đã hoàn tiền'};
const enStatuses:Record<string,string>={draft:'Draft',pending:'Pending',approved:'Approved',published:'Published',confirmed:'Confirmed',in_progress:'In progress',completed:'Completed',cancelled:'Cancelled',rejected:'Rejected',archived:'Archived',sold:'Sold',rented:'Rented',paid:'Paid',failed:'Failed',refunded:'Refunded'};
export function statusLabel(status:string,locale:Locale|string='vi'):string{return(locale==='vi'?viStatuses:enStatuses)[status]??status}
export function billingUnitLabel(unit:string,locale:Locale|string='vi'):string{const normalized=unit.toLowerCase();if(locale!=='vi')return normalized;return normalized==='month'?'tháng':normalized==='day'?'ngày':normalized==='night'?'đêm':unit}
