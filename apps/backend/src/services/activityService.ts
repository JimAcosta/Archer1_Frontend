import { CreateActivityDTO } from "@/DTOs/activity";
import prisma from "@/utils/prisma";


class ActivityService {
    async createActivity(data: CreateActivityDTO) {
        return await prisma.agroactivity.create({
            data: {
                plot: data.plot,
                crop: data.crop,
                date_year: data.date_year,
                date_month: data.date_month,
                date_day: data.date_day,
                activitytype: data.activitytype,
                responsible: data.responsible,
                description: data.description
            }
        });
    }
    async getActivitiesByExploitation(exploitationId: string) {

  console.log(
    "Buscando explotación:",
    exploitationId
  );

  // 1. Comprobar que existe
  const exploitation =
    await prisma.exploitation.findUnique({
      where: {
        id: exploitationId,
      },
    });

  console.log(
    "EXPLOTACIÓN ENCONTRADA:",
    exploitation
  );

  // 2. Mostrar TODAS las parcelas
  const allPlots =
    await prisma.plot.findMany({
      select: {
        id: true,
        name: true,
        exploitation: true,
      },
    });

  console.log(
    "TODAS LAS PARCELAS:",
    JSON.stringify(
      allPlots,
      null,
      2
    )
  );

  // 3. Buscar parcelas de esta explotación
  const plots =
    await prisma.plot.findMany({
      where: {
        exploitation: exploitationId,
      },
      select: {
        id: true,
        name: true,
        exploitation: true,
      },
    });

  console.log(
    "PARCELAS DE ESTA EXPLOTACIÓN:",
    plots
  );

  if (plots.length === 0) {
    console.log(
      "NO HAY PARCELAS ASOCIADAS A ESTA EXPLOTACIÓN"
    );

    return [];
  }

  // 4. Obtener IDs
  const plotIds =
    plots.map(
      plot => plot.id
    );

  console.log(
    "IDS DE PARCELAS:",
    plotIds
  );

  // 5. Buscar actividades
  const activities =
    await prisma.agroactivity.findMany({
      where: {
        plot: {
          in: plotIds,
        },
      },
    });

  console.log(
    "ACTIVIDADES ENCONTRADAS:",
    activities
  );

  return activities;
}






    async getFormOptions(producerId: string) {
        const plots = await prisma.plot.findMany({
            where: {
                exploitation_plot_exploitationToexploitation: {
                    producer: producerId
                }
            },
            include: {
                crop_crop_plotToplot: true
            }
        });
        const activitytypes = await prisma.activitytype.findMany();
        return { plots, activitytypes };
    }

    
}

export default new ActivityService();