@extends('layouts.app')

@section('title', 'Cadastrar Colaborador')

@section('content')
    <h1>Cadastrar Colaborador</h1>
    <form method="POST" action="{{ route('employees.store') }}">
        @csrf
        <div class="mb-3">
            <label class="form-label">Nome:</label>
            <input type="text" name="name" class="form-control" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Cargo:</label>
            <input type="text" name="role" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary">Cadastrar</button>
        <a href="{{ route('employees.index') }}" class="btn btn-secondary">Voltar</a>
    </form>
@endsection