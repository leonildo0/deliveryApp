<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class DeliveryShare extends Model
{
    protected $table = 'delivery_share';
    protected $primaryKey = 'iddelivery_share';

    protected $fillable = [
        'solicitacao_id',
        'share_token',
        'checkout_code',
        'checkout_code_visible',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'checkout_code_visible' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($share) {
            if (empty($share->share_token)) {
                $share->share_token = Str::random(64);
            }
            if (empty($share->checkout_code)) {
                $share->checkout_code = strtoupper(Str::random(6));
            }
        });
    }

    public function solicitacao(): BelongsTo
    {
        return $this->belongsTo(Solicitacao::class, 'solicitacao_id', 'idsolicitacao');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
