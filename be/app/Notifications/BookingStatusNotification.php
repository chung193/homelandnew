<?php
namespace App\Notifications;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
class BookingStatusNotification extends Notification {
    use Queueable;
    public function __construct(public Booking $booking, public string $message) {}
    public function via(object $notifiable): array { return ['mail']; }
    public function toMail(object $notifiable): MailMessage { return (new MailMessage)->subject('Cập nhật yêu cầu thuê bất động sản')->greeting('Xin chào '.$notifiable->name.'!')->line($this->message)->line('Bất động sản: '.($this->booking->property?->title ?? '#'.$this->booking->property_id))->line('Thời gian: '.$this->booking->start_date?->format('d/m/Y').' - '.$this->booking->end_date?->format('d/m/Y'))->action('Xem booking', rtrim((string)config('app.frontend_url'),'/').'/vi/customer/bookings'); }
}
