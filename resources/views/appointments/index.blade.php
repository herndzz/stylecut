@extends('layouts.app')

@section('title', 'Agendamentos')

@section('content')
    <h1>Lista de Agendamentos</h1>
    <a href="{{ route('appointments.create') }}" class="btn btn-primary mb-3">Agendar Serviço</a>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Colaborador</th>
                <th>Data e Hora</th>
                <th>Serviço</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($appointments as $appointment)
                <tr>
                    <td>{{ $appointment->id }}</td>
                    <td>{{ $appointment->client->name }}</td>
                    <td>{{ $appointment->employee ? $appointment->employee->name : 'Sem colaborador' }}</td>
                    <td>{{ $appointment->date_time }}</td>
                    <td>{{ $appointment->service }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <a href="{{ route('home') }}" class="btn btn-secondary">Voltar</a>
@endsection