<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $table = 'item';
    protected $primaryKey = 'iditem';

    protected $fillable = [
        'type',
        'weight_kg',
        'height_cm',
        'width_cm',
        'length_cm',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'weight_kg' => 'decimal:2',
            'height_cm' => 'decimal:2',
            'width_cm' => 'decimal:2',
            'length_cm' => 'decimal:2',
        ];
    }
}
