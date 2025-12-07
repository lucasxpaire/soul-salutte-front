import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, FileText, Clock } from 'lucide-react';
import { getSessoes, getClientes } from '@/services/api';
import { Sessao, Cliente } from '@/types';
import { format, isToday, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardProps {
  onAddSessao: () => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const Dashboard: React.FC<DashboardProps> = ({ onAddSessao }) => {
  const { user } = useAuth();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [totalAvaliacoes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessoesData, clientesData] = await Promise.all([
          getSessoes(),
          getClientes(),
        ]);
        setSessoes(sessoesData);
        setClientes(clientesData);

      } catch (error) {
        toast.error('Erro ao carregar dados do dashboard.');
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const memoizedStats = useMemo(() => {
    const sessoesHoje = sessoes.filter(sessao => isToday(new Date(sessao.dataHoraInicio)));
    const sessoesAgendadas = sessoes.filter(sessao => new Date(sessao.dataHoraInicio) >= new Date() && sessao.status === 'AGENDADA');

    const sessoesEsteMes = sessoes.filter(sessao => {
      const today = new Date();
      return isWithinInterval(new Date(sessao.dataHoraInicio), {
        start: startOfMonth(today),
        end: endOfMonth(today)
      });
    });

    return {
      totalClientes: clientes.length,
      sessoesHoje,
      sessoesAgendadas: sessoesAgendadas.length,
      sessoesEsteMes: sessoesEsteMes.length
    };
  }, [sessoes, clientes]);

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'AGENDADA': return { color: 'bg-blue-500', text: 'Agendada' };
      case 'CONCLUIDA': return { color: 'bg-green-500', text: 'Concluída' };
      case 'CANCELADA': return { color: 'bg-red-500', text: 'Cancelada' };
      default: return { color: 'bg-gray-500', text: 'Outro' };
    }
  };

  const clienteMap = useMemo(() => new Map(clientes.map(c => [c.id, c.nome])), [clientes]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{getGreeting()}, {user?.name}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{memoizedStats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">pacientes ativos</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <CalendarDays className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{memoizedStats.sessoesHoje.length}</div>
            <p className="text-xs text-muted-foreground">agendadas para hoje</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Sessões</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{memoizedStats.sessoesAgendadas}</div>
            <p className="text-xs text-muted-foreground">sessões a realizar</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <FileText className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAvaliacoes}</div>
            <p className="text-xs text-muted-foreground">documentos registrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Agenda do Dia</CardTitle>
                <CardDescription>
                  {format(new Date(), "eeee, dd 'de' MMMM", { locale: ptBR })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memoizedStats.sessoesHoje.length > 0 ? (
                memoizedStats.sessoesHoje
                  .sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())
                  .map((sessao) => (
                    <div key={sessao.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-1.5 h-10 rounded-full ${getStatusProps(sessao.status).color}`}></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{clienteMap.get(sessao.clienteId) || 'Cliente não encontrado'}</p>
                        <p className="text-sm text-muted-foreground">{sessao.nome}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">{format(new Date(sessao.dataHoraInicio), 'HH:mm')}</p>
                        <Badge variant="outline" className="mt-1">{getStatusProps(sessao.status).text}</Badge>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-10">
                  <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma sessão hoje</h3>
                  <p className="mt-1 text-sm text-gray-500">Aproveite para organizar sua semana ou adicionar um novo agendamento.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;