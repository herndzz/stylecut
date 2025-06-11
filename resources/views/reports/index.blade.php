@extends('layouts.app')

@section('title', 'Relatórios')

@section('content')
    <h1>Relatórios de Atendimento</h1>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Data e Hora</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($reports as $report)
                <tr>
                    <td>{{ $report->client->name }}</td>
                    <td>{{ $report->service }}</td>
                    <td>{{ $report->date_time }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <a href="{{ route('home') }}" class="btn btn-secondary">Voltar</a>
@endsection