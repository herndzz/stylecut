<?php
namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class ReportController extends Controller {
    public function index() {
        $reports = Appointment::with('client')
            ->orderBy('date_time', 'desc')
            ->get();
        return view('reports.index', compact('reports'));
    }
}