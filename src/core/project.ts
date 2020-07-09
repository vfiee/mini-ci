import { Project } from "miniprogram-ci";
import { ProjectOptions } from "../types";
function createProject(option: ProjectOptions): Project {
  return new Project(option);
}

export default createProject;
