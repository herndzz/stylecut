@extends('layouts.app')

@section('title', 'Clientes')

@section('content')
    <h1>Lista de Clientes</h1>
    <a href="{{ route('clients.create') }}" class="btn btn-primary mb-3">Cadastrar Cliente</a>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Preferências</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($clients as $client)
                <tr>
                    <td>{{ $client->id }}</td>
                    <td>{{ $client->name }}</td>
                    <td>{{ $client->phone }}</td>
                    <td>{{ $client->preferences ?? 'Nenhuma' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <a href="{{ route('home') }}" class="btn btn-secondary">Voltar</a>
@endsection