import activityService from "@/services/activityService";
import { Request, Response } from "express";
import { User } from "../DTOs/user";

export default {
    async createActivity(req: Request, res: Response) {
        const { plot, crop, activitytype, responsible, date_day, date_month, date_year, description } = req.body;
        const activity = await activityService.createActivity({ plot, crop, activitytype, responsible, date_day, date_month, date_year, description });
        return res.json(activity);
    },

    async getActivities(req: Request, res: Response) {
        const  User  = (req.user as User).id;;
        const activities = await activityService.getFormOptions(User);
        return res.json(activities);
    },

    async getFormOptions(req: Request, res: Response) {
        const  User  = (req.user as User).id;;
        const options = await activityService.getFormOptions(User);
        return res.json(options);
    },

    async getActivitiesByExploitation(req: Request, res: Response) {
        console.log("Llegue controler");
        const { exploitationId } = req.params;
        console.log(exploitationId);
        const activities =
        await activityService.getActivitiesByExploitation(
            exploitationId
        );

        res.json(activities);
    }



}
