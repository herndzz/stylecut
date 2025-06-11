@extends('layouts.app')

@section('title', 'Agendar Serviço')

@section('content')
    <h1>Agendar Serviço</h1>
    <form method="POST" action="{{ route('appointments.store') }}">
        @csrf
        <div class="mb-3">
            <label class="form-label">Cliente:</label>
            <select name="client_id" class="form-select" required>
                @foreach ($clients as $client)
                    <option value="{{ $client->id }}">{{ $client->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label">Colaborador:</label>
            <select name="employee_id" class="form-select" required>
                @foreach ($employees as $employee)
                    <option value="{{ $employee->id }}">{{ $employee->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label">Data e Hora:</label>
            <input type="datetime-local" name="date_time" class="form-control" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Serviço:</label>
            <input type="text" name="service" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary">Agendar</button>
        <a href="{{ route('appointments.index') }}" class="btn btn-secondary">Voltar</a>
    </form>
@endsection