<?php

namespace App\Notifications;

use App\Models\ViewingAppointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ViewingAppointmentNotification extends Notification
{
    use Queueable;

    public function __construct(public ViewingAppointment $appointment, public string $message, public bool $forOwner = false) {}

    public function via(object $notifiable): array
    {
        return filled($notifiable->email) ? ['mail'] : [];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appointment = $this->appointment;
        $url = rtrim((string) config('app.frontend_url'), '/').'/vi/'.($this->forOwner ? 'owner/viewing-appointments' : 'customer/viewing-appointments');

        return (new MailMessage)
            ->subject('Cập nhật lịch đi xem nhà')
            ->greeting('Xin chào '.$notifiable->name.'!')
            ->line($this->message)
            ->line('Bất động sản: '.($appointment->property?->title ?? '#'.$appointment->property_id))
            ->line('Thời gian: '.$appointment->appointment_date?->format('d/m/Y').' từ '.substr($appointment->start_time, 0, 5).' đến '.substr($appointment->end_time, 0, 5))
            ->when(filled($appointment->note), fn (MailMessage $mail) => $mail->line('Ghi chú: '.$appointment->note))
            ->action('Xem lịch hẹn', $url);
    }
}
