<?php
namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Employee;
use Illuminate\Http\Request;

class AppointmentController extends Controller {
    public function index() {
        $appointments = Appointment::with(['client', 'employee'])->get();
        return view('appointments.index', compact('appointments'));
    }

    public function create() {
        $clients = Client::all();
        $employees = Employee::all();
        return view('appointments.create', compact('clients', 'employees'));
    }

    public function store(Request $request) {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'employee_id' => 'required|exists:employees,id',
            'date_time' => 'required|date',
            'service' => 'required|string|max:255',
        ]);

        // Check for scheduling conflicts
        $conflict = Appointment::where('employee_id', $request->employee_id)
            ->where('date_time', $request->date_time)
            ->exists();

        if ($conflict) {
            return redirect()->back()->withErrors(['date_time' => 'Horário já ocupado para este colaborador!']);
        }

        Appointment::create($request->all());
        return redirect()->route('appointments.index')->with('success', 'Agendamento criado!');
    }
}