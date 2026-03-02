<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'usuario';
    protected $primaryKey = 'idusuario';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function root(): HasOne
    {
        return $this->hasOne(Root::class, 'usuario_idusuario', 'idusuario');
    }

    public function cliente(): HasOne
    {
        return $this->hasOne(Cliente::class, 'usuario_idusuario', 'idusuario');
    }

    public function entregador(): HasOne
    {
        return $this->hasOne(Entregador::class, 'usuario_idusuario', 'idusuario');
    }

    public function isRoot(): bool
    {
        return $this->role === 'root';
    }

    public function isCliente(): bool
    {
        return $this->role === 'cliente';
    }

    public function isEntregador(): bool
    {
        return $this->role === 'entregador';
    }

    public function getRoleProfile()
    {
        return match ($this->role) {
            'root' => $this->root,
            'cliente' => $this->cliente,
            'entregador' => $this->entregador,
            default => null,
        };
    }
}
