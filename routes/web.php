<?php
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::resource('clients', ClientController::class)->only(['index', 'create', 'store']);
    Route::resource('employees', EmployeeController::class)->only(['index', 'create', 'store']);
    Route::resource('appointments', AppointmentController::class)->only(['index', 'create', 'store']);
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
});

require __DIR__.'/auth.php';