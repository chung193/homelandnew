<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends VerifyEmail
{
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'api.v1.auth.verify.email',
            Carbon::now()->addMinutes(60),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    public function toMail($notifiable)
    {
        $url = config('app.frontend_url') .
            "/auth/verify-email?url=" . urlencode($this->verificationUrl($notifiable));

        return (new MailMessage)
            ->subject('✅ Xác thực email')
            ->greeting('Xin chào!')
            ->line('Vui lòng xác thực email để kích hoạt tài khoản.')
            ->action('Xác thực ngay', $url)
            ->line('Link hết hạn sau 60 phút.')
            ->salutation('Trân trọng, ' . config('app.name'));
    }
}
