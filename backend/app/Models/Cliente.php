<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $table = 'cliente';
    protected $primaryKey = 'idcliente';

    protected $fillable = [
        'usuario_idusuario',
        'status',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_idusuario', 'idusuario');
    }

    public function solicitacoes(): HasMany
    {
        return $this->hasMany(Solicitacao::class, 'cliente_id', 'idcliente');
    }

    public function hasActiveRequest(): bool
    {
        return $this->solicitacoes()
            ->whereIn('status', ['requested', 'accepted'])
            ->exists();
    }

    public function getActiveRequest(): ?Solicitacao
    {
        return $this->solicitacoes()
            ->whereIn('status', ['requested', 'accepted'])
            ->first();
    }
}
