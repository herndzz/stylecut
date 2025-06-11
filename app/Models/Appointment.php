<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model {
    protected $fillable = ['client_id', 'employee_id', 'date_time', 'service'];

    public function client() {
        return $this->belongsTo(Client::class);
    }

    public function employee() {
        return $this->belongsTo(Employee::class);
    }
}