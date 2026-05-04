from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def procesar_reserva(self, reserva_id):
    """
    Tarea asíncrona para procesar una reserva después de su creación.
    Envía notificaciones o realiza acciones adicionales en segundo plano.
    """
    try:
        from .models import Reserva

        reserva = Reserva.objects.get(id=reserva_id)
        logger.info(
            'Procesando reserva #%s para %s el %s a las %s',
            reserva_id,
            reserva.nombre_cliente,
            reserva.fecha,
            reserva.hora,
        )

        # Aquí se pueden agregar acciones adicionales como:
        # - Enviar correo de confirmación
        # - Enviar SMS
        # - Actualizar estadísticas
        # Por ejemplo: enviar_email_confirmacion(reserva)

        logger.info('Reserva #%s procesada exitosamente', reserva_id)
        return {'status': 'ok', 'reserva_id': reserva_id}

    except Exception as exc:
        logger.error('Error procesando reserva #%s: %s', reserva_id, exc)
        raise self.retry(exc=exc)
