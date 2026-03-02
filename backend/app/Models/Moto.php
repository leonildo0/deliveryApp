<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Moto extends Model
{
    protected $table = 'moto';
    protected $primaryKey = 'idmoto';

    protected $fillable = [
        'entregador_id',
        'plate',
        'model',
        'color',
    ];

    public function entregador(): BelongsTo
    {
        return $this->belongsTo(Entregador::class, 'entregador_id', 'identregador');
    }
}
