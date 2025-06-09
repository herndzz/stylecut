from flask import Flask, request, render_template, redirect, url_for, flash
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_aqui'  # Necessário para mensagens flash

# Inicializa o banco de dados SQLite
def init_db():
    conn = sqlite3.connect('stylecut.db')
    c = conn.cursor()
    # Tabela de clientes
    c.execute('''CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        preferences TEXT
    )''')
    # Tabela de colaboradores
    c.execute('''CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL
    )''')
    # Tabela de agendamentos
    c.execute('''CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        employee_id INTEGER,
        date_time TEXT NOT NULL,
        service TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (employee_id) REFERENCES employees (id)
    )''')
    conn.commit()
    conn.close()

init_db()

# Página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Adicionar cliente (RF02)
@app.route('/add_client', methods=['GET', 'POST'])
def add_client():
    if request.method == 'POST':
        nome = request.form['name']
        telefone = request.form['phone']
        preferencias = request.form.get('preferences', '')
        
        if not nome or not telefone:
            flash('Nome e telefone são obrigatórios!', 'error')
            return render_template('add_client.html')
        
        conn = sqlite3.connect('stylecut.db')
        c = conn.cursor()
        c.execute("INSERT INTO clients (name, phone, preferences) VALUES (?, ?, ?)",
                  (nome, telefone, preferencias))
        conn.commit()
        conn.close()
        flash('Cliente cadastrado com sucesso!', 'success')
        return redirect(url_for('list_clients'))
    return render_template('add_client.html')

# Listar clientes (RF02)
@app.route('/clients')
def list_clients():
    conn = sqlite3.connect('stylecut.db')
    c = conn.cursor()
    c.execute("SELECT id, name, phone, preferences FROM clients")
    clientes = c.fetchall()
    conn.close()
    return render_template('clients.html', clients=clientes)

# Adicionar colaborador (RF05)
@app.route('/add_employee', methods=['GET', 'POST'])
def add_employee():
    if request.method == 'POST':
        nome = request.form['name']
        cargo = request.form['role']
        
        if not nome or not cargo:
            flash('Nome e cargo são obrigatórios!', 'error')
            return render_template('add_employee.html')
        
        conn = sqlite3.connect('stylecut.db')
        c = conn.cursor()
        c.execute("INSERT INTO employees (name, role) VALUES (?, ?)", (nome, cargo))
        conn.commit()
        conn.close()
        flash('Colaborador cadastrado com sucesso!', 'success')
        return redirect(url_for('list_employees'))
    return render_template('add_employee.html')

# Listar colaboradores (RF05)
@app.route('/employees')
def list_employees():
    conn = sqlite3.connect('stylecut.db')
    c = conn.cursor()
    c.execute("SELECT id, name, role FROM employees")
    colaboradores = c.fetchall()
    conn.close()
    return render_template('employees.html', employees=colaboradores)

# Adicionar agendamento (RF01)
@app.route('/add_appointment', methods=['GET', 'POST'])
def add_appointment():
    if request.method == 'POST':
        client_id = request.form['client_id']
        employee_id = request.form['employee_id']
        data_hora = request.form['date_time']
        servico = request.form['service']
        
        # Validação básica para evitar conflitos de horário
        conn = sqlite3.connect('stylecut.db')
        c = conn.cursor()
        c.execute("SELECT id FROM appointments WHERE employee_id = ? AND date_time = ?",
                  (employee_id, data_hora))
        if c.fetchone():
            conn.close()
            flash('Horário já ocupado para este colaborador!', 'error')
            return redirect(url_for('add_appointment'))
        
        c.execute("INSERT INTO appointments (client_id, employee_id, date_time, service) VALUES (?, ?, ?, ?)",
                  (client_id, employee_id, data_hora, servico))
        conn.commit()
        conn.close()
        flash('Agendamento realizado com sucesso!', 'success')
        return redirect(url_for('list_appointments'))
    
    conn = sqlite3.connect('stylecut.db')
    c = conn.cursor()
    c.execute("SELECT id, name FROM clients")
    clientes = c.fetchall()
    c.execute("SELECT id, name FROM employees")
    colaboradores = c.fetchall()
    conn.close()
    return render_template('add_appointment.html', clients=clientes, employees=colaboradores)

# Listar agendamentos (RF01)
@app.route('/appointments')
def list_appointments():
    conn = sqlite3.connect('stylecut.db')
    c = conn.cursor()
    c.execute('''SELECT a.id, c.name, e.name, a.date_time, a.service 
                 FROM appointments a 
                 JOIN clients c ON a.client_id = c.id
                 JOIN employees e ON a.employee_id = e.id''')
    agendamentos = c.fetchall()
    conn.close()
    return render_template('appointments.html', appointments=agendamentos)

# Relatórios de atendimento (RF03)
@app.route('/reports')
def reports():
    conn = sqlite3.connect('stylecut.db')
    c = conn.cursor()
    c.execute('''SELECT c.name, a.service, a.date_time 
                 FROM appointments a 
                 JOIN clients c ON a.client_id = c.id 
                 ORDER BY a.date_time DESC''')
    relatorios = c.fetchall()
    conn.close()
    return render_template('reports.html', reports=relatorios)

if __name__ == '__main__':
    app.run(debug=True)
