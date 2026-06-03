<?php
// api/log-comentarios.php
// Endpoint para salvar comentários em arquivo de log

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

// Validação dos campos obrigatórios
$camposObrigatorios = ['nome', 'email', 'projeto', 'comentario'];
foreach ($camposObrigatorios as $campo) {
    if (empty(trim($input[$campo] ?? ''))) {
        http_response_code(400);
        echo json_encode(['error' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

// Validação de email
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

// Criar diretório de logs se não existir
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// Arquivo de log (um por mês)
$arquivoLog = $logDir . '/comentarios-' . date('Y-m') . '.json';

// Carregar logs existentes
$logsExistentes = [];
if (file_exists($arquivoLog)) {
    $conteudo = file_get_contents($arquivoLog);
    $logsExistentes = json_decode($conteudo, true) ?: [];
}

// Adicionar novo comentário
$registro = [
    'timestamp'   => date('Y-m-d H:i:s'),
    'nome'        => htmlspecialchars(trim($input['nome']), ENT_QUOTES, 'UTF-8'),
    'email'       => htmlspecialchars(trim($input['email']), ENT_QUOTES, 'UTF-8'),
    'projeto'     => htmlspecialchars(trim($input['projeto']), ENT_QUOTES, 'UTF-8'),
    'comentario'  => htmlspecialchars(trim($input['comentario']), ENT_QUOTES, 'UTF-8'),
    'ip'          => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido',
    'user_agent'  => $input['userAgent'] ?? 'desconhecido'
];

$logsExistentes[] = $registro;

// Salvar no arquivo
if (file_put_contents($arquivoLog, json_encode($logsExistentes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Comentário registrado']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar log']);
}
?>