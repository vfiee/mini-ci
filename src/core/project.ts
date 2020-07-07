import { Project } from "miniprogram-ci";
import { CreateProjectOption } from "../types";
function createProject(option: CreateProjectOption): Project {
  return new Project(option);
}

export default createProject;
