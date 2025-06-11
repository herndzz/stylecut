<?php
namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller {
    public function index() {
        $clients = Client::all();
        return view('clients.index', compact('clients'));
    }

    public function create() {
        return view('clients.create');
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'preferences' => 'nullable|string',
        ]);

        Client::create($request->all());
        return redirect()->route('clients.index')->with('success', 'Cliente cadastrado!');
    }
}