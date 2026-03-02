<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Entrega extends Model
{
    protected $table = 'entrega';
    protected $primaryKey = 'identrega';

    protected $fillable = [
        'entregador_id',
        'solicitacao_id',
        'status',
        'checkin_at',
        'checkout_at',
    ];

    protected function casts(): array
    {
        return [
            'checkin_at' => 'datetime',
            'checkout_at' => 'datetime',
        ];
    }

    public function entregador(): BelongsTo
    {
        return $this->belongsTo(Entregador::class, 'entregador_id', 'identregador');
    }

    public function solicitacao(): BelongsTo
    {
        return $this->belongsTo(Solicitacao::class, 'solicitacao_id', 'idsolicitacao');
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['checkin_pending', 'in_progress']);
    }

    public function canCheckin(): bool
    {
        return $this->status === 'checkin_pending';
    }

    public function canComplete(): bool
    {
        return $this->status === 'in_progress';
    }

    public function canBeCanceled(): bool
    {
        return in_array($this->status, ['checkin_pending', 'in_progress']);
    }
}
