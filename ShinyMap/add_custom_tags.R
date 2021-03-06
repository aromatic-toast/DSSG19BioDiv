# prepare the species info dataframe to contain custom tags for shiny app plotting 
library(tidyverse)

# read in the full BC rainbow list dataframe 
rainbow_list <- read.csv("~/Desktop/datasets/bc_rainbow_list.tsv",
                         sep = "\t",
                         stringsAsFactors = F,
                         na.strings = c("", " "))

# read in IUCN red list 
IUCN <- read.csv("~/Desktop/datasets/IUCN_redlist.csv",
                 stringsAsFactors = F,
                 na.strings = c("", " "))

# read in the specific species info data frame 
species_info <- read.csv("Taxonomy_Freq.csv", stringsAsFactors = F)

species_info <- species_info %>% rename(bc_list = BC.List, regional_dist = Regional.Dist, habitat_subtype = Habitat.Subtype)
 
# note: 
# it is of interest to know when each species was added to IUCN, BC red list, SARA etc.
# this info is available in the respective datasets for 
# - IUCN, yearPublished and assessmentDate columns 
# - BC rainbow Provincial status change date, (is the last date the species was added etc.)
# - BC rainbow , Global status review date 


# create a binary vector for IUCN red list species 
# 1 = entry is a string (ie is on IUCN) , 0 = entry is NA (ie not on redlist)
IUCN_binary <- c()
for (i in species_info$redList){
  if(is.na(i)){
    IUCN_binary <- c(IUCN_binary, 0)
  }else {
    IUCN_binary <- c(IUCN_binary, 1)
  }
}

# add the binary vector to the species_info dataframe 
species_info$IUCN_binary <- IUCN_binary


# create a binary vector for BC red listed species 
# 1 = entry is a string "red" , 0 = entry is anything that is not string "red"
bc_red_binary <- c()
for (i in species_info$bc_list){
  if(is.na(i)){
    bc_red_binary <- c(bc_red_binary, 0)
  }else if(i == "Red"){
    bc_red_binary <- c(bc_red_binary, 1)
  }else {
    bc_red_binary <- c(bc_red_binary, 0)
  }
}

# add the bc_red list binary vector to the species_info dataframe 
species_info$bc_red_binary <- bc_red_binary


# create a binary vector for BC blue listed species 
# 1 = entry is a string "Blue" , 0 = entry is anything that is not string "Blue"
bc_blue_binary <- c()
for (i in species_info$bc_list){
  if(is.na(i)){
    bc_blue_binary <- c(bc_blue_binary, 0)
    
  }else if(i == "Blue"){
    bc_blue_binary <- c(bc_blue_binary, 1)
    
  }else {
    bc_blue_binary <- c(bc_blue_binary, 0)
  }
}

# add the bc_blue list binary vector to the species_info dataframe 
species_info$bc_blue_binary <- bc_blue_binary


# create a binary vector for BC endemic listed species 
# these species are being tagged as only living in BC 
# 1 = entry is a string "Y" , 0 = entry is anything that is not string "Y"
bc_endemic_binary <- c()
for (i in species_info$Endemic){
  if(is.na(i)){
    bc_endemic_binary <- c(bc_endemic_binary, 0)
    
  }else if(i == "Y"){
    bc_endemic_binary <- c(bc_endemic_binary, 1)
    
  }else {
    bc_endemic_binary <- c(bc_endemic_binary, 0)
  }
}

# add the bc_blue list binary vector to the species_info dataframe 
species_info$bc_endemic_binary <- bc_endemic_binary




######  create a binary vector for pollinators ########
# pollinator info obtained from wikipedia 

# Note: the following species will be tagged as pollinators 
# the following are all hummingbirds 

# - Archilochus alexandri
# - Calypte anna
# - Calypte costae
# - Selasphorus rufus
# - Selasphorus sasin
# - Stellula calliope


# the following insect genera will be tagged as pollinators 
# - Apis (honeybees)
# - Bombus (bumblebees)

# the following insect families will be tagged as pollinators 
# family=="Masarinae" = pollen wasps 
#   family=="Formicidae"  = ants 
#   family=="Bombyliidae" = bee flies 
#   family=="Syrphidae" = hover flies 
#   family=="Buprestidae" = beetle
#   family=="Cantharidae" = beetle 
#   family=="Carambycidae" = beetle 
#   family=="Cleridae" = beetle 
#   family=="Dermestidae" = beetle 
#   family=="Lycidae" = beetle 
#   family=="Melyridae" = beetle 
#   family=="Mordellidae"  = beetle 
#   family=="Nitidulidae"  = beetle 
#   family=="Scarabeidae" = beetle 



# the following insect Order will be tagged as pollinators 
# they are moths and butterflies 
# Lepidoptera


# create a pollinators dataframe 
pollinators <- species_info %>% 
  filter(genus=="Apis" | 
           genus=="Bombus" | 
           order=="Lepidoptera" |
           family=="Masarinae" | 
           family=="Formicidae" | 
           family=="Bombyliidae" | 
           family=="Syrphidae" |
           family=="Buprestidae" |
           family=="Cantharidae" |
           family=="Carambycidae" |
           family=="Cleridae" |
           family=="Dermestidae" |
           family=="Lycidae" |
           family=="Melyridae" |
           family=="Mordellidae" |
           family=="Nitidulidae" |
           family=="Scarabeidae" |
           simplified_names == "Archilochus alexandri" |
           simplified_names == "Calypte anna" |
           simplified_names == "Calypte costae" |
           simplified_names == "Selasphorus rufus" |
           simplified_names == "Selasphorus sasin" |
           simplified_names == "Stellula calliope")


# create a binary vector for pollinator species 
# 1 = species is in the pollinator list above , 0 = species is not found in the pollinator list
pollinator_binary <- c()
for (i in species_info$simplified_names){
  if(i %in% pollinators$simplified_names){
    pollinator_binary <- c(pollinator_binary, 1)
  }else {
    pollinator_binary <- c(pollinator_binary, 0)
  }
}

# add the pollinator binary vector to the species_info dataframe 
species_info$pollinator_binary <- pollinator_binary

# rename the pollinator column to pollinator_binary
#species_info <- species_info %>% rename(pollinator_binary = pollinator)


# create a binary vector for SARA listed species 
# 1 = species is SARA listed, 0 = species is not on the SARA list 
sara_binary <- c()
for (i in species_info$SARA){
  if(is.na(i)){
    sara_binary <- c(sara_binary, 0)
  }else {
    sara_binary <- c(sara_binary, 1)
  }
}
# add the SARA binary vector to the species_info dataframe 
species_info$sara_binary <- sara_binary



# Turn the SARA designations into a human readable vector 

sara_designations <- c()
for(i in species_info$SARA){
  if(is.na(i)){
    sara_designations <- c(sara_designations, "Not Listed")
    
  } else if(length(grep("XX", i))> 0){
    sara_designations <- c(sara_designations, "Extinct")
    
  }else if(length(grep("XT", i))> 0){
    sara_designations <- c(sara_designations, "Extirpated")
    
  }else if(length(grep("E", i))> 0){
    sara_designations <- c(sara_designations, "Endangered")
    
  }else if(length(grep("T", i))> 0){
    sara_designations <- c(sara_designations, "Threatened")
    
  }else if(length(grep("SC", i))> 0){
    sara_designations <- c(sara_designations, "Special Concern")
    
  }else if(length(grep("NAR", i))> 0){
    sara_designations <- c(sara_designations, "Not At Risk")
    
  }else if(length(grep("DD", i))> 0){
    sara_designations <- c(sara_designations, "Data Deficient")
    
  }else
    sara_designations <- c(sara_designations, "Not Listed")
}

# add the sara designations vector to the species_info dataframe 
species_info$sara_designations <- sara_designations




write.csv(species_info, file = "Taxonomy_Freq.csv", row.names = FALSE)


