<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusHistory extends Model
{
    protected $table = 'status_history';
    protected $primaryKey = 'idstatus_history';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'old_status',
        'new_status',
        'changed_at',
        'changed_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
        ];
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'changed_by_user_id', 'idusuario');
    }

    public static function recordChange(
        string $entityType,
        int $entityId,
        ?string $oldStatus,
        string $newStatus,
        int $changedByUserId
    ): self {
        return self::create([
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_at' => now(),
            'changed_by_user_id' => $changedByUserId,
        ]);
    }
}
