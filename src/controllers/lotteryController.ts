import { Request, Response } from 'express';
import { Lottery } from '../models/Lottery';
import { AuditAction } from '../constants/auditActions';
import { auditService } from '../services/audit.service';

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
