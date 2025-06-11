@extends('layouts.app')

@section('title', 'Cadastrar Cliente')

@section('content')
    <h1>Cadastrar Cliente</h1>
    <form method="POST" action="{{ route('clients.store') }}">
        @csrf
        <div class="mb-3">
            <label class="form-label">Nome:</label>
            <input type="text" name="name" class="form-control" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Telefone:</label>
            <input type="text" name="phone" class="form-control" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Preferências:</label>
            <textarea name="preferences" class="form-control"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Cadastrar</button>
        <a href="{{ route('clients.index') }}" class="btn btn-secondary">Voltar</a>
    </form>
@endsection