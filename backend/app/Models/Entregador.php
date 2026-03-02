<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Entregador extends Model
{
    protected $table = 'entregador';
    protected $primaryKey = 'identregador';

    protected $fillable = [
        'usuario_idusuario',
        'status',
        'current_location_id',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_idusuario', 'idusuario');
    }

    public function moto(): HasOne
    {
        return $this->hasOne(Moto::class, 'entregador_id', 'identregador');
    }

    public function currentLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'current_location_id', 'idlocation');
    }

    public function entregas(): HasMany
    {
        return $this->hasMany(Entrega::class, 'entregador_id', 'identregador');
    }

    public function hasActiveDelivery(): bool
    {
        return $this->entregas()
            ->whereIn('status', ['checkin_pending', 'in_progress'])
            ->exists();
    }

    public function getActiveDelivery(): ?Entrega
    {
        return $this->entregas()
            ->whereIn('status', ['checkin_pending', 'in_progress'])
            ->first();
    }

    public function isOnline(): bool
    {
        return $this->status === 'online';
    }

    public function isBusy(): bool
    {
        return $this->status === 'busy';
    }
}
