<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Root extends Model
{
    protected $table = 'root';
    protected $primaryKey = 'idroot';

    protected $fillable = [
        'usuario_idusuario',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_idusuario', 'idusuario');
    }
}
