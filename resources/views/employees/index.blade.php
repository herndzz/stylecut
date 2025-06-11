@extends('layouts.app')

@section('title', 'Colaboradores')

@section('content')
    <h1>Lista de Colaboradores</h1>
    <a href="{{ route('employees.create') }}" class="btn btn-primary mb-3">Cadastrar Colaborador</a>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Cargo</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($employees as $employee)
                <tr>
                    <td>{{ $employee->id }}</td>
                    <td>{{ $employee->name }}</td>
                    <td>{{ $employee->role }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <a href="{{ route('home') }}" class="btn btn-secondary">Voltar</a>
@endsection