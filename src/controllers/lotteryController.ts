import { Request, Response } from 'express';
import { Lottery } from '../models/Lottery';
import { AuditAction } from '../constants/auditActions';
import { auditService } from '../services/audit.service';

//Crear una Lotería
export const createLottery = async (req: Request, res: Response) => {
  try {
    const { name, slug, gameDays, gameTime, isActive } = req.body;

    const lotteryExists = await Lottery.findOne({ slug });
    if (lotteryExists) {
      return res.status(400).json({ message: 'Ya existe una lotería con ese slug' });
    }

    const newLottery = new Lottery({
      name,
      slug,
      gameDays,
      gameTime,
      isActive,
    });

    await newLottery.save();

    // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.LOTTERY_CREATE,
      `Nueva Loteria Creada por el usuario ${req.user?.email}`,
      req.user?.id
    );

    return res.status(201).json({ message: 'Lotería creada correctamente', lottery: newLottery });
  } catch (error) {
    console.error('[createLottery]', error);
    return res.status(500).json({ message: 'Error al crear la lotería' });
  }
};

//Crear muchas loterias al tiempo con objeto JSON
export const bulkCreateLotteries = async (req: Request, res: Response) => {
  try {
    const lotteries = req.body; // ya está validado por Zod
    const created: any[] = [];
    const skipped: any[] = [];

    for (const lot of lotteries) {
      const exists = await Lottery.findOne({ slug: lot.slug });
      if (exists) {
        skipped.push({ ...lot, reason: 'Ya existe con ese slug' });
        continue;
      }

      const newLottery = new Lottery(lot);
      await newLottery.save();
      created.push(newLottery);
    }

    // Auditoría general del lote creado
    await auditService.logEvent(
      req,
      AuditAction.LOTTERY_CREATE,
      `Carga masiva de ${created.length} loterías por ${req.user.email}`,
      req.user._id.toString()
    );

    return res.status(201).json({
      message: 'Carga masiva procesada',
      createdCount: created.length,
      skippedCount: skipped.length,
      created,
      skipped
    });
  } catch (error) {
    console.error('[bulkCreateLotteries]', error);
    return res.status(500).json({ message: 'Error al procesar la carga masiva' });
  }
};


// Crear muchas loterias al tiempo usando archivo JSON
export const bulkUploadLotteriesFromFile = async (req: Request, res: Response) => {
  try {
    const fileBuffer = req.file?.buffer;

    if (!fileBuffer) {
      return res.status(400).json({ message: 'Archivo no encontrado o inválido' });
    }

    const jsonString = fileBuffer.toString('utf-8');
    const lotteries = JSON.parse(jsonString);

    if (!Array.isArray(lotteries)) {
      return res.status(400).json({ message: 'El archivo debe contener un array de loterías' });
    }

    const created: any[] = [];
    const skipped: any[] = [];

    for (const lot of lotteries) {
      if (!lot.slug || !lot.name) {
        skipped.push({ ...lot, reason: 'Datos incompletos' });
        continue;
      }

      const exists = await Lottery.findOne({ slug: lot.slug });
      if (exists) {
        skipped.push({ ...lot, reason: 'Ya existe con ese slug' });
        continue;
      }

      const newLottery = new Lottery(lot);
      await newLottery.save();
      created.push(newLottery);
    }

    await auditService.logEvent(
      req,
      AuditAction.LOTTERY_CREATE,
      `Carga masiva desde archivo: ${created.length} loterías por ${req.user.email}`,
      req.user._id.toString()
    );

    return res.status(201).json({
      message: 'Archivo procesado correctamente',
      createdCount: created.length,
      skippedCount: skipped.length,
      created,
      skipped
    });

  } catch (error) {
    console.error('[bulkUploadLotteriesFromFile]', error);
    return res.status(500).json({ message: 'Error al procesar el archivo' });
  }
};

export const getLotteries = async (req: Request, res: Response) => {
  try {
    // Parámetros opcionales de paginación
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const skip = (page - 1) * limit;

    const [lotteries, total] = await Promise.all([
      Lottery.find().skip(skip).limit(limit).sort({ name: 1 }),
      Lottery.countDocuments(),
    ]);

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      lotteries,
    });
  } catch (error) {
    console.error('[getLotteries]', error);
    res.status(500).json({ message: 'Error al obtener las loterías' });
  }
};

export const updateLottery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lottery = await Lottery.findById(id);
    if (!lottery) {
      return res.status(404).json({ message: 'Lotería no encontrada' });
    }

    Object.assign(lottery, updates);
    await lottery.save();

    await auditService.logEvent(
      req,
      AuditAction.LOTTERY_UPDATE,
      `Lotería actualizada por el usuario ${(req as any).user.email}`,
      (req as any).user._id.toString()
    );

    return res.status(200).json({ message: 'Lotería actualizada correctamente', lottery });
  } catch (error) {
    console.error('[updateLottery]', error);
    return res.status(500).json({ message: 'Error al actualizar la lotería' });
  }
};

export const deleteLottery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lottery = await Lottery.findById(id);
    if (!lottery) {
      return res.status(404).json({ message: 'Lotería no encontrada' });
    }

    await lottery.deleteOne();

    await auditService.logEvent(
      req,
      AuditAction.LOTTERY_DELETE,
      `Lotería eliminada por el usuario ${(req as any).user.email}`,
      (req as any).user._id.toString()
    );

    return res.status(200).json({ message: 'Lotería eliminada correctamente' });
  } catch (error) {
    console.error('[deleteLottery]', error);
    return res.status(500).json({ message: 'Error al eliminar la lotería' });
  }
};

export const getLotteryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lottery = await Lottery.findById(id);
    if (!lottery) {
      return res.status(404).json({ message: 'Lotería no encontrada' });
    }

    return res.status(200).json({ lottery });
  } catch (error) {
    console.error('[getLotteryById]', error);
    return res.status(500).json({ message: 'Error al obtener la lotería' });
  }
};