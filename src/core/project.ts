import { Project } from "miniprogram-ci";
import { ProjectOptions } from "../types";

const createProject = (option: ProjectOptions): Project => new Project(option);

export default createProject;
