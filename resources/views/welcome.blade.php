@extends('layouts.app')

@section('title', 'Início')

@section('content')
    <h1>Style Cut</h1>
    <p>Sistema de gerenciamento para cabeleireiros</p>
    @auth
        <div class="d-flex flex-wrap gap-2">
            <a href="{{ route('clients.create') }}" class="btn btn-primary">Cadastrar Cliente</a>
            <a href="{{ route('clients.index') }}" class="btn btn-primary">Listar Clientes</a>
            <a href="{{ route('employees.create') }}" class="btn btn-primary">Cadastrar Colaborador</a>
            <a href="{{ route('employees.index') }}" class="btn btn-primary">Listar Colaboradores</a>
            <a href="{{ route('appointments.create') }}" class="btn btn-primary">Agendar Serviço</a>
            <a href="{{ route('appointments.index') }}" class="btn btn-primary">Listar Agendamentos</a>
            <a href="{{ route('reports.index') }}" class="btn btn-primary">Relatórios</a>
        </div>
    @else
        <p>Por favor, faça login para acessar o sistema.</p>
    @endauth
@endsection