import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReservaList from '../components/ReservaList';
import * as apiModule from '../services/api';

vi.mock('../services/api');

const mockReservas = {
  results: [
    {
      id: 1,
      nombre_cliente: 'Juan Pérez',
      telefono: '1234567890',
      fecha: '2026-04-20',
      hora: '18:00',
      mesa: 1,
      mesa_numero: 1,
      mesa_ubicacion: 'Interior',
      estado: 'Confirmada',
      creada_en: '2026-04-13T10:00:00Z',
    },
  ],
};

describe('ReservaList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe renderizar lista de reservas', async () => {
    const mockGetReservas = vi.fn().mockResolvedValue({
      success: true,
      data: mockReservas,
    });

    vi.spyOn(apiModule.apiClient, 'getReservas').mockImplementation(mockGetReservas);

    render(
      <BrowserRouter>
        <ReservaList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mis Reservas')).toBeDefined();
    });
  });

  it('debe mostrar mensaje si no hay reservas', async () => {
    const mockGetReservas = vi.fn().mockResolvedValue({
      success: true,
      data: { results: [] },
    });

    vi.spyOn(apiModule.apiClient, 'getReservas').mockImplementation(mockGetReservas);

    render(
      <BrowserRouter>
        <ReservaList />
      </BrowserRouter>
    );

    await waitFor(() => {
      const noReservasText = screen.queryByText('No tienes reservas aún');
      expect(noReservasText).toBeDefined();
    });
  });

  it('debe renderizar tabla con datos de reservas', async () => {
    const mockGetReservas = vi.fn().mockResolvedValue({
      success: true,
      data: mockReservas,
    });

    vi.spyOn(apiModule.apiClient, 'getReservas').mockImplementation(mockGetReservas);

    render(
      <BrowserRouter>
        <ReservaList />
      </BrowserRouter>
    );

    await waitFor(() => {
      const clienteCell = screen.getByText('Juan Pérez');
      expect(clienteCell).toBeDefined();
    });
  });

  it('debe llamar getReservas al montar', async () => {
    const mockGetReservas = vi.fn().mockResolvedValue({
      success: true,
      data: mockReservas,
    });

    vi.spyOn(apiModule.apiClient, 'getReservas').mockImplementation(mockGetReservas);

    render(
      <BrowserRouter>
        <ReservaList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockGetReservas).toHaveBeenCalledTimes(1);
    });
  });
});
