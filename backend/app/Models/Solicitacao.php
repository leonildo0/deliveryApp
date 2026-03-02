<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Solicitacao extends Model
{
    protected $table = 'solicitacao';
    protected $primaryKey = 'idsolicitacao';

    protected $fillable = [
        'cliente_id',
        'status',
        'item_id',
        'pickup_location_id',
        'dropoff_location_id',
        'checkin_code',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($solicitacao) {
            if (empty($solicitacao->checkin_code)) {
                $solicitacao->checkin_code = strtoupper(Str::random(6));
            }
        });
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id', 'idcliente');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'iditem');
    }

    public function pickupLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'pickup_location_id', 'idlocation');
    }

    public function dropoffLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'dropoff_location_id', 'idlocation');
    }

    public function entrega(): HasOne
    {
        return $this->hasOne(Entrega::class, 'solicitacao_id', 'idsolicitacao');
    }

    public function deliveryShare(): HasOne
    {
        return $this->hasOne(DeliveryShare::class, 'solicitacao_id', 'idsolicitacao');
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['requested', 'accepted']);
    }

    public function canBeCanceled(): bool
    {
        return $this->status === 'requested';
    }

    public function canBeAccepted(): bool
    {
        return $this->status === 'requested';
    }
}
